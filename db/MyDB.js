import "dotenv/config"; // to load .env file

import { MongoClient, ObjectId } from "mongodb";

function MyDB() {
  const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
  const myDB = {};

  const connect = () => {
    const client = new MongoClient(uri);
    const db = client.db("CafeCompassRests");

    return { client, db };
  };

  myDB.getRestaurants = async (amenities) => {
    let query = {};
    if (amenities?.length) { // a good use of optional chaining to check if amentities is undefined
      amenities = amenities.split(","); 
      query = { // learnt a lot from how you wrote this query. took a while for me to understand.
        $and: amenities.map((am) => {
          const result = {};
          result[`Amenities.${am}`] = { $gt: 0 };
          return result;
        }),
      };
    }

    const { client, db } = connect();
    const restaurantsCollection = db.collection("approvedRestaurants");

    try {
      return await restaurantsCollection.find(query).limit(20).toArray();
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  myDB.updateRestaurantAmenities = async (restaurantId, updatedAmenities) => {
    const { client, db } = connect();
    const restaurantsCollection = db.collection("approvedRestaurants");

    try {
      const filter = { _id: new ObjectId(restaurantId) };
      const update = {
        $inc: updatedAmenities.reduce((acc, amenity) => { 
          return { ...acc, [`Amenities.${amenity}`]: 1 }; // is there a particular reason why we do a shallow copy and add the key-value pair?
          // would it be the same if we keep adding key-value pair one after another to an object without doing shallow copy?
        }, {}),
      };

      const result = await restaurantsCollection.updateOne(filter, update);

      return result.matchedCount > 0;
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  myDB.addNewRestaurant = async (newRestaurant) => {
    const { client, db } = connect();
    const restaurantsCollection = db.collection("approvedRestaurants");

    try {
      const result = await restaurantsCollection.insertOne(newRestaurant);
      return result;
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  // Delete
  myDB.deleteRestaurant = async (id) => {
    const { client, db } = await connect();
    const restaurantsCollection = db.collection("approvedRestaurants");

    try {
      const filter = { _id: new ObjectId(id) };
      const result = await restaurantsCollection.deleteOne(filter);
      return result;
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  return myDB;
}

export const myDB = MyDB();
