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
      console.log(dvideo);
    } else {
      window.alert("VideoChain contract not deployed to the detected network.");
    }
    //Get network data
    //Check if net data exists, then
    //Assign dvideo contract to a variable
    //Add dvideo to the state

    //Check videoAmounts
    //Add videAmounts to the state

    //Iterate throught videos and add them to the state (by newest)

    //Set latest video and it's title to view as default
    //Set loading state to false

    //If network data doesn't exisits, log error
  }

  //Get video
  captureFile = (event) => {};

  //Upload video
  uploadVideo = (title) => {};

  //Change Video
  changeVideo = (hash, title) => {};

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      account: "",
      //set states
    };

    //Bind functions
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
          //states&functions
          />
        )}
      </div>
    );
  }
}

export default App;
