import React, { Component } from "react";
import DVideo from "../abis/DVideo.json";
import Navbar from "./Navbar";
import Main from "./Main";
import Web3 from "web3";
import "./App.css";

//Declare IPFS
const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); // leaving out the arguments will default to these values

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // load accounts
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    //Adding first account the the state
    this.setState({ account: accounts[0] });

    //Get network ID
    const networkId = await web3.eth.net.getId();
    const networkData = DVideo.networks[networkId];
    if (networkData) {
      const dvideo = new web3.eth.Contract(DVideo.abi, networkData.address);
      this.setState({ dvideo });
      console.log(dvideo);

      // get videos count
      const videosCount = await dvideo.methods.videoCount().call();
      this.setState({ videosCount });
      console.log(videosCount);

      // load videos, and sort by newest!
      for (let i = videosCount; i >= 1; i--) {
        const video = await dvideo.methods.Videos(i).call();
        console.log(video);
        this.setState({ videos: [...this.state.videos, video] });
      }

      // set latest video with title to view as the default video
      const latest = await dvideo.methods.Videos(videosCount).call();
      console.log(latest);
      this.setState({ currentHash: latest.hash, currentTitle: latest.title });

      // initial setup done hence set loading to false
      this.setState({ loading: false });
    } else {
      window.alert("VideoChain contract not deployed to the detected network.");
    }
  }

  //Get video
  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  // upload video to ipfs
  uploadVideo = (title) => {
    console.log("Submitting file to IPFS...");

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log("IPFS result", result);
      if (error) {
        console.error(error);
        return;
      }
      this.setState({ loading: true });
      this.state.dvideo.methods
        .uploadVideo(result[0].hash, title)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({ loading: false });
        });
    });
  };

  //Change Video
  changeVideo = (hash, title) => {
    this.setState({ currentHash: hash });
    this.setState({ currentTitle: title });
  };

  constructor(props) {
    super(props);
    // initial states for the application
    this.state = {
      buffer: null,
      account: "",
      dvideo: null,
      videos: [],
      loading: true,
      currentHash: null,
      currentTitle: null,
    };

    this.uploadVideo = this.uploadVideo.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
            changeVideo={this.changeVideo}
            videos={this.state.videos}
            uploadVideo={this.uploadVideo}
            captureFile={this.captureFile}
            currentHash={this.state.currentHash}
            currentTitle={this.state.currentTitle}
          />
        )}
      </div>
    );
  }
}

export default App;
