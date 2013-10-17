require 'eventmachine'
require 'em-websocket'
require 'json'
require 'amqp'

require 'memcached'
require 'json'

$cache = Memcached.new("localhost:11211")

$key = 'items'

def get
  items = []
  begin
    value = $cache.get($key)
    items = value
  rescue Memcached::NotFound
    set([])
  end
  return items
end

def set(items)
  $cache.set $key, items
end

class WebSocketHandler
  def onopen(ws, handshake)
    data = get
    event = { :type => "full", :data => data }
    ws.send event.to_json
    AMQP.connect(:host => '127.0.0.1') do |connection, open_ok|
      AMQP::Channel.new(connection) do |channel, openok|
        channel.queue("").bind(channel.fanout("itemsfan")).subscribe do |event|
          ws.send event
        end
      end
    end
  end

  def onclose(ws)
    puts "closed"
  end

  def persist(event)
    data = get
    if (event["type"] == "add")
      data << (event["data"][0])
    end

    if (event["type"] == "remove")
      id = event["data"][0]["id"]
      data = data.select { |v| v["id"] != id }
    end
    set(data)
  end

  def onmessage(ws, msg)
    persist(JSON.parse(msg))
    AMQP.connect(:host => '127.0.0.1') do |connection, open_ok|
      AMQP::Channel.new(connection) do |channel, openok|
        channel.fanout("itemsfan").publish msg
      end
    end
  end
end
