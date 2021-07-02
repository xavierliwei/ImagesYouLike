const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const https = require("https");
var fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const vision = require('@google-cloud/vision');

var cors = require("cors");

const storage = new Storage({
	projectId: "PhotosYouLike",
	keyFilename:
		"/Users/weili/workplace/CMU/SeeTheWorld/backend/photosyoulike-f7bc35e7e199.json",
});
const visionClient = new vision.ImageAnnotatorClient({
	projectId: "PhotosYouLike",
	keyFilename:
		"/Users/weili/workplace/CMU/SeeTheWorld/backend/photosyoulike-f7bc35e7e199.json",
});

const bucket = storage.bucket("cmu-2021-cc-project");

const upload = async (url, res) => {
	const imageId = url.slice(34, 60);
	
    const file = fs.createWriteStream("./images/" + imageId + ".jpg");
	https.get(url, (response) => {
		response.pipe(file)
			.on("error", function (err) {})
			.on("finish", function () {
				console.log("image saved");
				// The file saving is complete.

				var localReadStream = fs.createReadStream(
					"./images/" + imageId + ".jpg"
				);
				var remoteWriteStream = bucket
					.file(imageId + ".jpg")
					.createWriteStream();
				localReadStream
					.pipe(remoteWriteStream)
					.on("error", function (err) {})
					.on("finish", function () {
						console.log("image uploaded");
						// The file upload is complete.
                        webDetection(imageId, res)
					});
			});
	});
};

const webDetection = async (imageId, res) => {
	const imageUri = "gs://cmu-2021-cc-project/" + imageId + ".jpg"
    const [result] = await visionClient.webDetection(imageUri);
    const webDetection = result.webDetection
    if (webDetection.visuallySimilarImages.length) {
        console.log(
          `visuallySimilarImages found: ${webDetection.visuallySimilarImages.length}`
        );
        // webDetection.visuallySimilarImages.forEach(image => {
        //   console.log(`  URL: ${image.url}`);
        //   console.log(`  Score: ${image.score}`);
        // });
        res.status(200).send(webDetection.visuallySimilarImages.slice(0,3))
      }
};

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.listen(9001, () => {
	console.log("app now listening for requests!!!");
});

app.post("/uploads", (req, res, next) => {
	console.log("upload req incoming!!", req.body.url);
	// res.status(200).send({data: 'mock data'})
    upload(req.body.url, res);
});
