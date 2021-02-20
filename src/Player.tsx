import React, { Component, createRef } from 'react';
import Amplify, { Storage } from 'aws-amplify';
import playImage from './play.png';
import pauseImage from './pause.png';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

type PlayerState = {
    playerData: string;
    playing: boolean;
};

type PlayerProperties = {
    audioKey: string;
}

export class Player extends Component<PlayerProperties, PlayerState> {
    private audioPlayer = createRef<HTMLAudioElement>();

    constructor(props: PlayerProperties) {
        super(props);
        const initialState: PlayerState = {
            playerData: '',
            playing: false
        };
        this.state = initialState;
        this.setState(initialState);
    }

    componentWillMount() {
    }

    componentDidMount() {

    }

    async onAudioEnded() {
        if (this.audioPlayer && this.audioPlayer.current && this.state.playing) {
            const newState: PlayerState = 
            {
                playerData: this.state.playerData,
                playing: this.state.playing
            };
            newState.playing = false;
            this.audioPlayer.current.currentTime = 0;
            this.setState(newState);            
        }
    }

    async playPause() {
        try {
            if (this.audioPlayer && this.audioPlayer.current && this.props.audioKey) {
                const newState: PlayerState = 
                    {
                        playerData: this.state.playerData,
                        playing: this.state.playing
                    };
                if (!this.state.playing) {
                    if (this.state.playerData === '' || !this.audioPlayer.current.src) {
                        // We need to load the player data
                        // I really don't want sensitive voicemails to even be put on a public S3
                        // url (even if it is pre-signed). Just doesn't feel right to get a VM
                        // as a URL, so let's directly download the audio for playback
                        Storage.configure({customPrefix: {public: ''}});
                        const playerData: any = await Storage.get(this.props.audioKey, {download: true}) as any;
                        if (playerData && playerData.ContentLength > 0 && playerData.Body) {
                            newState.playerData = URL.createObjectURL(playerData.Body);
                            this.audioPlayer.current.src = newState.playerData;
                        }
                    }
                    await this.audioPlayer.current.play();
                    newState.playing = true;
                }
                else {
                    this.audioPlayer.current.pause();
                    newState.playing = false;
                }
                this.setState(newState);
            }
        } catch (playError) {
            console.log("Play error...");
            console.log(playError);
        }
    }

    render() {
        return (
            <span>
                <img onClick={() => { return this.playPause(); }} className="pull-right"  
                    src={(this.state && this.state.playing) ? pauseImage : playImage} width='32' height='32' />
                <audio ref={this.audioPlayer} onEnded={() => { this.onAudioEnded(); }} autoPlay={false} preload="auto" />
            </span>
        );
    };
};

export default Player;