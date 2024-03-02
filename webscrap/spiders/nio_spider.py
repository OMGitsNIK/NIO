import scrapy

class NIOSpider(scrapy.Spider):
    name = 'nio_spider'
    start_urls = ['https://wiseoceans.com/creature-feature-friday-yellow-tube-sponge/']

    def parse(self, response):
        # Initialize a dictionary to store taxonomy information
        taxonomy = {}

        # Find the div containing all the information
        info_div = response.css('.wp-block-cover__inner-container')

        # Extract text from the div
        info_text = info_div.css('::text').getall()

        # Process the extracted text to populate the taxonomy dictionary
        current_key = None
        for line in info_text:
            line = line.strip()
            if line:
                if ':' in line:
                    current_key, value = line.split(':', 1)
                    taxonomy[current_key.strip()] = value.strip()
                elif current_key:
                    taxonomy[current_key] += " " + line.strip()

        yield {
            'taxonomy': taxonomy
        }
