

up:
	docker-compose up
rebuild:
    # up and force a rebuild 
	docker-compose up --build
down:
	# down and remove all previous images in this project
	docker-compose down --rmi all

ingestFile:
	# ingest a sample file in the running ch instance
	docker run --rm -v $(pwd)/ingest:/usr/src/app -w /usr/src/app node:23.5.0 npm run ingestFile