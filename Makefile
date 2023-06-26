up:
	docker-compose -f docker-compose.yml up --force-recreate

backend:
    cd src/server
    npm start


frontend:
    cd src/frontend 
	npm start