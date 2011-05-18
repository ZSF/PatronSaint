require 'rubygems'
require "bundler/setup"
require 'ducks'
require 'yaml'

overrides = {}
ducks = DucksWADL::Document.new('api.wadl')
ducks.resources.each do |resource|
  overrides[ resource.base_path ] ||= {}
  resource.methods.each do |method|
    params = method.params
    overrides[ resource.base_path ][ method.id ] ||= {} unless params.empty?
    params.each do |param|
      overrides[ resource.base_path ][ method.id ][ param.name ] = nil
    end
  end
end

overrides.delete_if do |key,value|
  value.empty?
end

puts overrides.to_yaml

