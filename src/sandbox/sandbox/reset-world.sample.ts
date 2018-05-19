import { ContactData } from '../../serializers/contact';

export const sample = {
    "type": "world-sync",
    "data": {
        "bodies": [
            {
                "userData": {
                    "id": "arena",
                    "type": "arena"
                },
                "type": "static",
                "linearVelocity": {
                    "x": 0,
                    "y": 0
                },
                "angularVelocity": 0,
                "position": {
                    "x": 0,
                    "y": 0
                },
                "angle": 0,
                "radius": 1
            },
            {
                "userData": {
                    "id": "black-hole",
                    "type": "black-hole"
                },
                "type": "static",
                "linearVelocity": {
                    "x": 0,
                    "y": 0
                },
                "angularVelocity": 0,
                "position": {
                    "x": 0,
                    "y": 0
                },
                "angle": 0,
                "radius": 0.125
            },
            {
                "userData": {
                    "id": "ship-a",
                    "type": "ship"
                },
                "type": "dynamic",
                "linearVelocity": {
                    "x": 0,
                    "y": 0
                },
                "angularVelocity": 0,
                "position": {
                    "x": -0.6,
                    "y": -0.6
                },
                "angle": 0,
                "radius": 0.05
            },
            {
                "userData": {
                    "id": "ship-b",
                    "type": "ship"
                },
                "type": "dynamic",
                "linearVelocity": {
                    "x": 0,
                    "y": 0
                },
                "angularVelocity": 0,
                "position": {
                    "x": 0.6,
                    "y": 0.6
                },
                "angle": 3.141592653589793,
                "radius": 0.05
            }
        ],
        "contacts": [] as ContactData[]
    }
};
