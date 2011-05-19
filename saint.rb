require 'rubygems'
require "bundler/setup"
require 'sinatra'
require 'zappos'
require 'lib/ducks'
require 'lib/patron_helper'
require 'lib/partials'
require 'json'
require 'erb'

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
patron  = PatronHelper.new( ducks, 'api/includes.yaml', 'api/includes.yaml' )

helpers do
  include Sinatra::Partials
  include Rack::Utils
  alias_method :h, :escape_html
end

get '/' do
  @resources = patron.resource_list
  erb :index
end

get '/resource*' do
  @resources = patron.find_resources( params[:splat].first )
  erb :resource, :layout => false
end

get '/method*/:method' do
  base_path = params[:splat].first
  method_id = params[:method]
  @resource, @method = patron.find_resource_and_method( base_path, method_id )
  @includes = patron.includes_checkboxes_for( base_path )
  if @method
    erb :method #, :layout => false
  else
    404
  end
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