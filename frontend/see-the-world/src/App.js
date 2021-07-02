import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import './App.css'

const unsplashApiKey = "xoVOa-f3RUbRt-ld-Oi3saYIwxT0tiHDlHCw_9hJrKs"

const style = {
	// height: 30,
	border: "1px solid green",
	margin: 6,
	padding: 8,
  innerWidth:400,
};

function App() {
	const [items, setItems] = useState([]);
	useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?client_id=${unsplashApiKey}&count=5`
      );
      const data = JSON.parse(await response.text());
      const urls = data.map((item) => item.urls.small);
      setItems(urls);
    }
		fetchData()
	}, []);

	const onDoubleClickImage = (event) => {
		sendUrlToBackend({ url: event.target.src });
	};
	const fetchMoreData = async () => {
		console.log("fetch more triggered!");

		const response = await fetch(
			`https://api.unsplash.com/photos/random?client_id=${unsplashApiKey}&count=5`
		);
		const data = JSON.parse(await response.text());
		const urls = data.map((item) => item.urls.small);
		setItems(items.concat(urls));
	};

	const sendUrlToBackend = async (reqObject) => {
		const res = await fetch("http://localhost:9001/uploads", {
			method: "POST",
			headers: {
				"Content-Type": "Application/json",
			},
			body: JSON.stringify(reqObject),
		});
    const data = JSON.parse(await res.text());
    const idx = items.findIndex(url => url === reqObject.url)
    let newItems = items.slice(0, idx+1).concat(data.map(row => row.url)).concat(items.slice(idx+1))
    // setItems(items.concat(data.map(row => row.url)))
    setItems(newItems)
    console.log(data)
	};

	return (
		<div className='App'>
			<h1>ImagesYouLike</h1>
			<hr></hr>
			<InfiniteScroll
				dataLength={items.length}
				next={_.throttle(fetchMoreData, 2000)}
				hasMore={true}
				loader={<h4>Loading...</h4>}
			>
				{items.map((url, index) => (
					<div style={style} key={url}>
						<button onDoubleClick={onDoubleClickImage}>
							<img src={url} />
						</button>
					</div>
				))}
			</InfiniteScroll>
		</div>
	);
}

export default App;
