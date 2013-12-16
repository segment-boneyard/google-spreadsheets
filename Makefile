node_modules: package.json
	@npm install

test:
	@./node_modules/.bin/mocha --reporter spec

clean:
	@rm -fr node_modules

.PHONY: test