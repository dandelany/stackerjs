from bs4 import BeautifulSoup
import urllib2
import re
import time
from pprint import pprint as pp
import json

base_url = 'http://jsoc.stanford.edu/data/aia/synoptic/'
date_url = '2014/08/09/H2300/'
url = base_url + date_url

user_agent = "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36"
headers = {'User-Agent': user_agent}
r = urllib2.Request(url, headers=headers)
response = urllib2.urlopen(r).read()

soup = BeautifulSoup(response)
fits_links = filter(lambda x: re.search('.+\.fits', x), map(lambda x: x.get('href'), soup.find_all('a')))
pp(fits_links)
print len(fits_links)


urls_obj = {'base_url': base_url, 'dates': [{'date_url': date_url, 'filenames': fits_links}]}
pp(urls_obj)
outfile = open("data/fits_urls.json", 'w')
outfile.write(json.dumps(urls_obj))
outfile.close()
