# module Jekyll
#   class SlideGallery < Liquid::Tag
#     def initialize(tag_name, text, tokens)
#       super
#       @urls = text.split(',').map(&:strip)
#     end

#     def render(context)
#       config = context.registers[:site].config
#       base_url = config['post_images_url']
#       images_html = @urls.map do |url|
#         full_url = "#{base_url}#{url}"
#         "<img src='#{full_url}' alt='#{url}'>"
#       end
#       "<div class='custom-images-container'>#{images_html.join("\n")}</div>"
#     end
#   end
# end
  
# Liquid::Template.register_tag('slide_gallery', Jekyll::SlideGallery)
  
module Jekyll
  class SlideGallery < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @params = parse_params(markup)
      @urls = @params['urls']&.split(',')&.map(&:strip) || []  # Handle nil case with default empty array
      @class = @params['class'] || ''  # Set default value to an empty string
      @baseurl = @params['baseurl'] || ''
    end

    def parse_params(markup)
      params = {}
      markup.scan(Liquid::TagAttributes) do |key, value|
        params[key] = value
      end
      params
    end

    def render(context)
      config = context.registers[:site].config
      base_url = @baseurl.empty? ? config['post_images_url'] : @baseurl
      images_html = @urls.map do |url|
        full_url = File.join(base_url, url)
        "<img src='#{full_url}' alt='#{url}'>"
      end
      div_class = @class.nil? || @class.empty? ? '' : "class='#{@class}'"
      "<div #{div_class}><div class='custom-images-container'>#{images_html.join("\n")}</div></div>"
    end
  end
end

Liquid::Template.register_tag('slide_gallery', Jekyll::SlideGallery)