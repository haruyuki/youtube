class YouTube < Liquid::Tag
  Shorthand = /youtu\.be\/([^\?]*)/
  Syntax = /^.*((v\/)|(embed\/)|(watch\?))\??v?=?([^\&\?]*).*/

  def initialize(tagName, content, tokens)
    super
    @content = content
  end

  def render(context)
    link = "#{context[@content.strip]}"
    if link =~ Shorthand
      @id = $1
    else
      link =~ Syntax
      @id = $5
    end

    "<iframe title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen
        src=\"https://www.youtube.com/embed/#{@id}\"> </iframe>"
  end

  Liquid::Template.register_tag "youtube", self
end