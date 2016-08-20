require "oga"

class CategoryBuilder

    def initialize(database)
        @database = database
    end

    def download(index)
        url = %Q[http://www.store.com/clearance.html?page=#{index}]
        puts url
        filename = %Q[/tmp/clearance_#{index}.html]
        system(%Q[bash download.sh "#{url}" "#{filename}"])
        puts filename
        count = process(filename)
        # system(%Q[rm "#{filename}"])

        count > 0
    end

    def process(filename)
        fileString = File.read(filename)
        document = Oga.parse_html(fileString)
        productList = document.css('a.productbox')

        productList.each do |product|
        #     print ">"
        #     @database.upsert(product.get('data-sku'), product.get('href'))
              product = nil #Clear for Garbage Collection
        end

        # count = productList.length
        fileString = nil  #Clear for Garbage Collection
        document = nil    #Clear for Garbage Collection
        productList = nil #Clear for Garbage Collection

        # count
        1
    end

end
