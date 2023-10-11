import { MongoClient } from "mongodb";

function MyDB() {
  const uri = "mongodb://localhost:27017";
  const myDB = {};

  const connect = () => {
    const client = new MongoClient(uri);
    const db = client.db("CafeCompassRests");

    return { client, db };
  };

  myDB.getRestaurants = async (amenities) => {
    let query = {};
    if (amenities?.length) {
      amenities = amenities.split(",");
      query = {
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
      const result = await restaurantsCollection.updateOne(
        { _id: new MongoClient.ObjectID(restaurantId) },
        {
          $inc: updatedAmenities.reduce((acc, amentiy) => {
            acc[`Amenities.${amentiy}`] += 1;
            return acc;
          }, {}),
        }
      );

      return result.matchedCount > 0;
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  return myDB;
}

export const myDB = MyDB();
