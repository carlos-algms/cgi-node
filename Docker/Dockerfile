FROM httpd:2-alpine

RUN \
	apk upgrade --no-cache && \
	apk add --no-cache --upgrade \
		nodejs \
		npm

RUN \
	echo "Include conf/extra/enable-node-cgi.conf" >> /usr/local/apache2/conf/httpd.conf && \
	mkdir /usr/local/apache2/node-sessions && \
	chown www-data:www-data /usr/local/apache2/node-sessions

COPY enable-node-cgi.conf /usr/local/apache2/conf/extra/enable-node-cgi.conf
