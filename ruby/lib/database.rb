require 'sqlite3'
require 'time'

class Database

    def initialize()
        @timestamp = Time.now.to_i

        file = '/var/local/clearance.sqlite'
        system(%Q[touch "#{file}"])
        @sqlite = SQLite3::Database.new file
    end

    def setup()
        createCommand = 'CREATE TABLE IF NOT EXISTS catalog
            (
                sku TEXT,
                url TEXT,
                latest_time NUM,
                previous_time NUM,
                PRIMARY KEY (sku)
                ON CONFLICT REPLACE
            )'
        @sqlite.execute(createCommand);

        updateCommand = 'UPDATE catalog SET previous_time = latest_time'
        @sqlite.execute(updateCommand);
    end

    def upsert(sku, url)
        upsertCommand = 'INSERT INTO catalog
            (sku, url, latest_time, previous_time)
            VALUES
            (?, ?, ?, (SELECT latest_time FROM catalog WHERE sku = ?))'

        @sqlite.execute(upsertCommand, [sku, url, @timestamp, sku]);
    end

    def report()
        count = 'SELECT
            (SELECT COUNT(sku) FROM catalog WHERE previous_time IS NULL)
                AS new_count,
            (SELECT COUNT(sku) FROM catalog WHERE latest_time = (SELECT MAX(latest_time) FROM catalog))
                AS current_count,
            (SELECT COUNT(sku) FROM catalog WHERE latest_time = previous_time)
                AS old_count'

        @sqlite.execute(count) do |row|
            p row
        end

        # @sqlite.execute('SELECT * FROM catalog') do |row|
        #     p row
        # end
    end

end
