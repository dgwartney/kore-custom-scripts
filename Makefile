.PHONY: all clean test

all: apis.zip

test:
	npm test

apis.zip:
	zip -r apis.zip apis main.js package.json restClient.js

clean:
	rm -f apis.zip
	rm -rf coverage
