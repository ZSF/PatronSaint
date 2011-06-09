require 'yaml'

class PatronHelper
  
  def initialize( ducks, variables, includes, autocompletes )
    @ducks = ducks
    @variables     = YAML.load_file( variables )
    @includes      = YAML.load_file( includes )
    @autocompletes = YAML.load_file( autocompletes )
  end
  
  module Helpers
    
    # Prints a checkbox for includes, handling the special '.' notation to denote a default include.
    def includes_checkbox( name, field )
      if matches = field.match(/^\.(.*)/)
        %Q{<label class="default"><input type="checkbox" name="#{name}[]" class="default" value="#{matches[1]}"> #{matches[1]}</label>}
      else
        %Q{<label><input type="checkbox" name="#{name}[]" value="#{field}"> #{field}</label>}
      end
    end
    
  end
  
  def autocomplete_values( source )
    return @autocompletes[ source ] || []
  end
  
  def resource_list
    @ducks.resources.map { |r| r.base_path }.uniq.sort
  end
  
  def find_resources( base_path )
    resources = []
    @ducks.resources.each do |resource|
      resources << resource if resource.base_path == base_path
    end
    return resources
  end
  
  def find_resource_and_method( base_path, method_id )
    @ducks.resources.each do |resource|
      next unless resource.base_path == base_path
      resource.methods.each do |method|
        next unless method.id == method_id
        extend_params( resource, method )
        return resource, method
      end
    end
    nil
  end
  
  def includes_checkboxes_for( base_path )
    @includes[ base_path ] || []
  end
  
  private
    
  def extend_params( resource, method )
    if extension = @variables[ resource.base_path ][ method.id ] rescue nil
      method.params.each do |param|
        if param_extension = extension[ param.name ]
          param_extension.each do |key,value|
            case key
            when 'autocomplete'
              if value.is_a?( Hash )
                # jsonMap autocompletes have a special format
                key_autocomplete = value.keys.first
                param.set( 'key_autocomplete', key_autocomplete )
                param.set( 'value_autocomplete', value[ key_autocomplete ] )
              else
                param.set( key, value )
              end
            else
              # By default, just pass values through
              param.set( key, value )
            end
          end
        end
      end
    end    
  end
    
end

if __FILE__ == $0
  require 'ducks'
  require 'pp'
  
  ducks   = DucksWADL::Document.new('../api/api.wadl')
  
  p = PatronHelper.new( ducks, '../api/parameters.yaml', '../api/includes.yaml', '../api/autocompletes.yaml' )
  pp p.includes_checkboxes_for( '/Search' )
  
  # resource, method = p.find_resource_and_method( '/Search', 'getSearch' )
  # 
  # method.params.each do |param|
  #   puts param.name
  #   puts param.type
  #   puts param.key_autocomplete
  #   puts param.value_autocomplete
  #   puts '---'
  # end
  
end