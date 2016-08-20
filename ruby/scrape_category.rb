#!/usr/bin/ruby
$stdout.sync = true

require './lib/database.rb'
require './lib/category_builder.rb'

database = Database.new()
database.setup()

categoryBuilder = CategoryBuilder.new(database)

index = 1
while categoryBuilder.download(index)  do
   index += 1
end

database.report()
