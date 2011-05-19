require 'rubygems'
require 'nokogiri'

module DucksWADL

  ##
  # Describes a WADL document  
  class Document

    def initialize( filename )
      @wadl = Nokogiri::XML( open( filename ) )
    end
  
    # Return a list of resources described by this WADL
    def resources
      resource_list = []
      @wadl.css('resources').each do |resources|
        base = resources.attr('base')
        resources.css('resource').each do |resource|
          resource_list << Resource.new( resource, base )
        end
      end
      # TODO : This is a hack for Jason's bug
      resource_list.uniq
    end
    
  end

  ##
  # A REST API resource
  class Resource
    
    def initialize( resource, base=nil )
      @resource = resource
      @base = nil
    end
    
    def path
      @path ||= @resource.attr('path')
    end
    
    # Return the resource path with any parameters stripped out
    def base_path
      @base_path ||= path.split(%r{(?:/[a-z\{]|\?)}).first
    end
    
    def methods
      method_list = []
      method_params = []
      @resource.children.each do |child|
        next unless child.element?
        case child.name
          when 'param'
            method_params << child
          when 'method'
            method_list << Method.new( child, method_params )
            method_params = []
        end
      end
      method_list
    end
    
    # TODO : This is a hack for Jason's bug
    def hash
      path.hash
    end

    # TODO : This is a hack for Jason's bug
    def eql?( other )
      path == other.path
    end
    
  end
  
  ##
  # An API method
  class Method
    
    def initialize( method, params=[] )
      @method = method
      @params = params
    end
    
    def name
      @method.attr('name')
    end

    def displayName
      @method.attr('displayName') || name
    end

    def id
      return @method.attr('id')
    end
    
    def authenticated?
      @method.xpath('./apigee:authentication').each do |authenticated|
        required = authenticated.attr('required')
        return required && required.match(/true/i)
      end
      return false
    end

    # TODO: Belongs on the method? Look at APIAttribute method
    def params
      param_list = []
      @params.each do |param|
        param_list << Param.new( param )
      end
      param_list
    end

  end  
  
  ##
  # An API method parameter
  class Param
    
    def initialize( param )
      @param = param
    end
    
    [ :name, :type, :style, :default ].each do |method|
      define_method( method ) do
        @param.attr( method.to_s )
      end
    end
        
    def required?
      required = @param.attr('required') 
      required && required.match(/true/i)
    end
    
  end
  
end

if __FILE__ == $0

  # ducks = DucksWADL::Document.new('api.wadl')
  ducks = DucksWADL::Document.new('../api/zappos-wadl.xml')
  ducks.resources.each do |resource|
    puts resource.path
    puts resource.base_path
    resource.methods.each do |method|
      puts "  #{method.displayName} (#{method.name})"
      method.params.each do |param|
        if param.required?
          puts "    * #{param.name}"
        else
          puts "    #{param.name}"
        end
      end
    end
    puts
  end
  
end