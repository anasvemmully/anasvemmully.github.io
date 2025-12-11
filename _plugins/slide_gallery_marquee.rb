module Jekyll
  class SlideGalleryMarquee < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @params = parse_params(markup)
      @urls = @params['urls']&.split(',')&.map(&:strip) || []
      @speed = @params['speed'] || 'normal'  # slow, normal, fast
    end

    def parse_params(markup)
      params = {}
      markup.scan(/(\w+)\s*=\s*['"]([^'"]+)['"]/) do |key, value|
        params[key] = value
      end
      params
    end

    def generate_title_from_filename(filename)
      # Remove file extension
      name = File.basename(filename, File.extname(filename))
      # Replace underscores, hyphens with spaces
      name = name.gsub(/[_-]/, ' ')
      # Convert to title case
      name.split.map(&:capitalize).join(' ')
    end

    def render(context)
      # Get the current page path
      page = context.registers[:page]
      page_dir = File.dirname(page['path'])

      # Extract folder name from post path (e.g., "devfest-kochi-2023" from "_posts/devfest-kochi-2023/...")
      folder_name = File.basename(page_dir)

      # Generate images HTML with proper alt and title
      # Images are served from assets/images/posts/{folder_name}/
      images_html = @urls.map do |url|
        # Use assets path
        full_url = "/assets/images/posts/#{folder_name}/#{url}"
        title_text = generate_title_from_filename(url)
        "<img src='#{full_url}' alt='#{title_text}' title='#{title_text}' loading='lazy'>"
      end

      # Duplicate images for seamless loop
      all_images = images_html + images_html

      marquee_speed_class = case @speed
                            when 'slow' then 'marquee-slow'
                            when 'fast' then 'marquee-fast'
                            else 'marquee-normal'
                            end

      <<-HTML
<div class="slide-gallery-marquee-container">
  <div class="slide-gallery-marquee #{marquee_speed_class}">
    <div class="marquee-content">
      #{all_images.join("\n      ")}
    </div>
  </div>
</div>
      HTML
    end
  end
end

Liquid::Template.register_tag('slide_gallery_marquee', Jekyll::SlideGalleryMarquee)
