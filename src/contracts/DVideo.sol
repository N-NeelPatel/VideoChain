// SPDX-License-Identifer: MIT
pragma solidity ^0.5.0;

contract DVideo {
    uint256 public videoCount = 0;
    string public name = "VideoChain";
    mapping(uint256 => Video) public Videos;
    // id=>struct mapping for storing and listing the Video list

    // Struct for Video
    struct Video {
        uint256 id;
        string hash;
        string title;
        address author;
    }

    // Event for videoUpload
    event VideoUploaded{
      uint256 id;
      string hash;
      string title;
      address author;
    };

    constructor() public {}

    function uploadVideo(string memory _videoHash, string memory _title)
        public
    {
        // video hash should exists
        require(bytes(_videoHash).length > 0);
        //  video title should exists
        require(bytes(_title).length > 0);
        // uploader address should exists
        require(msg.sender != address(0));

        videoCount++;        

        // Add video to the contract
        Videos[videoCount] = Video(videoCount, _videoHash, _title, msg.sender);
        
        // Trigger an event
        emit VideoUploaded(videoCount, _videoHash, _title, msg.sender);
    }
}
