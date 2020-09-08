FROM pith-api_common

EXPOSE 8080

CMD [ "python3.8", "-m", "watchgod", "app.main" ]
