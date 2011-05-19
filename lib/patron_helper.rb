require 'yaml'

class PatronHelper
  
  def initialize( ducks, variables, includes )
    @ducks = ducks
    @variables = YAML.load_file( variables )
    @includes  = YAML.load_file( includes )
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
        return resource, method
      end
    end
    nil
  end
  
  def includes_checkboxes_for( base_path )
    @includes[ base_path ] || []
  end
    
end

if __FILE__ == $0
  
  p = PatronHelper.new( nil, '../api/variables.yaml', '../api/includes.yaml' )
  
end