require 'rubygems'
require "bundler/setup"
require 'sinatra'
require 'zappos'
require './lib/ducks'
require './lib/patron_helper'
require './lib/partials'
require './lib/mu/cache'
require 'json'
require 'erb'

use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['zappos', 'zappos']
end

# Monkey patches. Patches of monkeys. Patched monkeys.
class Zappos::Client
  def call_method( method, endpoint, options={} )
    execute( request( method, endpoint, options ) )
  end
end

class Zappos::Response
  def code
    @response.code
  end
  def response
    @response
  end
end

API_KEY = '6fd74cc5be050f2c1760441f3cc203460dcf7cc7'
zappos  = Zappos.client(API_KEY)
ducks   = DucksWADL::Document.new('api/api.wadl')
patron  = PatronHelper.new( ducks, 'api/parameters.yaml', 'api/includes.yaml', 'api/autocompletes.yaml' )

helpers do
  include Sinatra::Partials
  include Rack::Utils
  include PatronHelper::Helpers
  alias_method :h, :escape_html
end

def cache
   @@cache ||= Mu::Cache.new :max_size => 1024, :max_time => 30.0
end

get '/' do
  @resources = patron.resource_list
  erb :index
end

get '/resource*' do
  @base_path = params[:splat].first
  @resources = patron.find_resources( @base_path )
  erb :resource, :layout => layout?
end

get '/method*/:method' do
  base_path = params[:splat].first
  method_id = params[:method]
  @resource, @method = patron.find_resource_and_method( base_path, method_id )
  @includes = patron.includes_checkboxes_for( base_path )
  if @method
    erb :method, :layout => layout?
  else
    404
  end
end

get '/autocomplete/:source' do
  data = case params[:source]
  when 'facets'
    cache.fetch 'facets' do
      zappos.search_facet_list
    end
  when 'facetValues'    
    zappos.search_facet_values( params[:key] ).collect { |f| f[:name] }
  when 'productId'
    zappos.statistics( :type => 'latestStyles', :limit => 25 ).results.collect { |r| r.productId }
  when 'styleId'
    zappos.statistics( :type => 'latestStyles', :limit => 25 ).results.collect { |r| r.styleId }
  when 'brandId'
    cache.fetch 'brands' do
      zappos.search( :excludes => ['results'], :facets => 'brandId' ).facets[0][:values].collect { |f| f.name }
    end
  else
    patron.autocomplete_values( params[:source] )
  end
  if term = params[:term]
    data = data.select { |v| v.downcase.include?( term.downcase ) }
  end
  data.to_json
end

post '/call' do
  call_params = params[:params] || {}
  call_params.delete_if { |key,value| value.to_s.empty? }
  response = zappos.call_method( params[:method].capitalize, params[:resource], { :query_params => call_params } )
  headers = []
  response.response.each_header { |header,value| headers << [ header, value ] }
  {
    :headers => headers,
    :code    => response.code,
    :url     => URI.unescape( response.request_uri.to_s ).gsub( API_KEY, '{YOUR_KEY_HERE}' ),
    :body    => JSON.pretty_generate( response.data )
  }.to_json
end

def layout?
  params[:inline] ? false : true
end