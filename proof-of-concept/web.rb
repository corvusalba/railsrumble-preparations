require 'sinatra/base'

class WebController < Sinatra::Base
  configure do
    set :threaded, false
    set :public_folder, 'public'
  end

  get '/' do
    redirect '/index.html'
  end
end
