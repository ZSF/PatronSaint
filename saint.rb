require 'rubygems'
require "bundler/setup"
require 'sinatra'
require 'zappos'
require 'ducks'
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
ducks   = DucksWADL::Document.new('api.wadl')

helpers do
  include Rack::Utils
  alias_method :h, :escape_html
end

get '/' do
  @resources = ducks.resources.map { |r| r.base_path }.uniq.sort
  erb :index
end

get '/resource*' do
  base_path = params[:splat].first
  @resources = []
  ducks.resources.each do |resource|
    @resources << resource if resource.base_path == base_path
  end
  erb :resource, :layout => false
end

get '/method*/:method' do
  base_path = params[:splat].first
  method_id = params[:method]
  ducks.resources.each do |resource|
    if resource.base_path == base_path
      resource.methods.each do |method|
        if method.id == method_id
          @method   = method
          @resource = resource
          break
        end
      end
    end
    break if @resource
  end
  if @resource
    erb :method, :layout => false
  else
    "Method Not Found"
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