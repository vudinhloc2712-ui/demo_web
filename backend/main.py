from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from pydantic import BaseModel
from fastapi import HTTPException
from fastapi.responses import Response
import xml.etree.ElementTree as ET
app = FastAPI(
    title="Weather Information API"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# WEATHER DATA
# ==========================================

weather_data = [
    {
        "id": 1,
        "city": "Hanoi",
        "date": "2026-10-20",
        "temperature": 25,
        "humidity": 80,
        "wind": 12,
        "weather": "Cloudy"
    },
    {
        "id": 2,
        "city": "Ho Chi Minh City",
        "date": "2026-10-20",
        "temperature": 30,
        "humidity": 70,
        "wind": 15,
        "weather": "Sunny"
    }
]


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Weather Information API is running"
    }


# ==========================================
# GET WEATHER - JSON
# ==========================================

@app.get("/weather")
def get_weather():

    return weather_data


# ==========================================
# GET WEATHER - XML
# ==========================================

@app.get("/weather/xml")
def get_weather_xml():

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'

    xml += "<weatherData>\n"

    for item in weather_data:

        xml += "    <weather>\n"

        xml += f"        <id>{item['id']}</id>\n"

        xml += f"        <city>{item['city']}</city>\n"

        xml += f"        <date>{item['date']}</date>\n"

        xml += f"        <temperature>{item['temperature']}</temperature>\n"

        xml += f"        <humidity>{item['humidity']}</humidity>\n"

        xml += f"        <wind>{item['wind']}</wind>\n"

        xml += f"        <description>{item['weather']}</description>\n"

        xml += "    </weather>\n"

    xml += "</weatherData>"


    return Response(
        content=xml,
        media_type="application/xml"
    )

class WeatherInput(BaseModel):
    city: str
    date: str
    temperature: float
    humidity: float
    wind: float
    weather: str


@app.post("/weather")
def add_weather(item: WeatherInput):
    new_id = max(
        (record["id"] for record in weather_data),
        default=0
    ) + 1

    record = {
        "id": new_id,
        **item.model_dump()
    }

    weather_data.append(record)

    return record


@app.put("/weather/{weather_id}")
def update_weather(weather_id: int, item: WeatherInput):
    for index, record in enumerate(weather_data):
        if record["id"] == weather_id:
            updated_record = {
                "id": weather_id,
                **item.model_dump()
            }

            weather_data[index] = updated_record
            return updated_record

    raise HTTPException(
        status_code=404,
        detail="Weather record not found"
    )


@app.delete("/weather/{weather_id}", status_code=204)
def delete_weather(weather_id: int):
    for index, record in enumerate(weather_data):
        if record["id"] == weather_id:
            weather_data.pop(index)
            return Response(status_code=204)

    raise HTTPException(
        status_code=404,
        detail="Weather record not found"
    )
