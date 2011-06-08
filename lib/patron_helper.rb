require 'yaml'

class PatronHelper
  
  def initialize( ducks, variables, includes, autocompletes )
    @ducks = ducks
    @variables     = YAML.load_file( variables )
    @includes      = YAML.load_file( includes )
    @autocompletes = YAML.load_file( autocompletes )
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
    if extension = @variables[ resource.base_path ][ method.id ]
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
  
  ducks   = DucksWADL::Document.new('../api/api.wadl')
  
  p = PatronHelper.new( ducks, '../api/variables.yaml', '../api/includes.yaml', '../api/autocompletes.yaml' )
  resource, method = p.find_resource_and_method( '/Search', 'getSearch' )
  
  method.params.each do |param|
    puts param.name
    puts param.type
    puts param.key_autocomplete
    puts param.value_autocomplete
    puts '---'
  end
  
end