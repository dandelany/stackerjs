from bs4 import BeautifulSoup
import urllib2
import re
import time
from pprint import pprint as pp
import json

url = 'http://jsoc.stanford.edu/data/aia/synoptic/2014/08/09/H2300/'

user_agent = "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36"
headers = { 'User-Agent' : user_agent }
r = urllib2.Request(url, headers=headers)
response = urllib2.urlopen(r).read()

soup = BeautifulSoup(response)
fits_links = filter(lambda x: re.search('.+\.fits', x), map(lambda x: x.get('href'), soup.find_all('a')))
pp(fits_links)
print len(fits_links)



for fits_filename in fits_links:
    img_url = url + fits_filename
    r = urllib2.Request(img_url, headers=headers)
    img_data = urllib2.urlopen(r).read()
    print img_url

    output = open("data/fits/" + fits_filename, 'wb')
    output.write(img_data)
    output.close()
    print "got it! sleeping..."
    time.sleep(5)

# ds9 AIA20140809_2358_0094.fits -scale asinh -scale limits 0 80 -export png test.png -exit