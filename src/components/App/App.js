import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import T from 'transmute-framework';
import Geolocation from "react-geolocation";
import {FlyToInterpolator} from 'react-map-gl';

import withRoot from '../withRoot';

import Map from '../Map';

import * as TreeService from '../../tree-service';

console.log(TreeService);

var ipfsAPI = require('ipfs-api');

const styles = theme => ({
    root: {
        // textAlign: 'center',
        // paddingTop: theme.spacing.unit * 20
    }
});

let lastClick = {
    latitude: 30.3072,
    longitude: -97.756
};


class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: false,
            image: 'http://via.placeholder.com/350x150',
            ...lastClick
        };

        this.getLocation = this.getLocation.bind(this);
    }


    async componentWillMount() {
        const stateFromTreeService = await TreeService.getStartState();
        console.log(stateFromTreeService);

        this.setState({
            ...stateFromTreeService
        });
    }

    upload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const ipfs = ipfsAPI('ec2-18-222-231-169.us-east-2.compute.amazonaws.com', 443);   // Connect to IPFS
            const buf = Buffer(reader.result); // Convert data into buffer
            ipfs.files.add(buf, (err, result) => {
                // Upload buffer to IPFS
                if (err) {
                    console.error(err);
                    return;
                }
                let url = `http://ec2-18-222-231-169.us-east-2.compute.amazonaws.com:8080/ipfs/${result[0].hash}`;
                this.setState({
                    image: url
                });
            });
        };
        const photo = document.getElementById('photo');
        reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
    };

    handleClose = () => {
        this.setState({
            open: false
        });
    };

    handleClick = () => {
        this.setState({
            open: true
        });
    };

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    handleSaveTree = async () => {
        console.log('about to save: ', this.state);
        await TreeService.saveTree(this.state);
    };

    onClick = event => {
        let lastClick = {
            longitude: event.lngLat[0],
            latitude: event.lngLat[1]
        };

        this.setState({
            ...lastClick
        });
    };

    setCurrentPosition = position => {
        let newPosition = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        };

        this.setState({
            ...newPosition
        });

        this.goToLocation(newPosition.latitude, newPosition.longitude);
    }

    innerRef;
    getLocation = () => {
        this.innerRef && this.innerRef.getCurrentPosition;
    }

    mapRef;
    goToLocation = (lat, long) => {
        const viewport = {
            ...this.mapRef.state.viewport,
            longitude: long,
            latitude: lat,
            zoom: 18,
            transitionDuration: 5000,
            transitionInterpolator: new FlyToInterpolator()
        };
        this.mapRef.setState({viewport});
    };


    render() {
        const {classes} = this.props;
        const {open} = this.state;

        const { getLocation, setCurrentPosition } = this;

        if (!this.state.streamModel) {
            return null;
        }

        let modelTrees = this.state.streamModel.model
            ? this.state.streamModel.model.trees
            : [];

        return (
            <div className={classes.root}>
                <pre>{JSON.stringify(this.state.lastClick)}</pre>

                {/*<Button
                    color="primary"
                    variant="raised"
                    onClick={this.showTreeForm}
                >
                    New Tree
                </Button>*/}

                <Map trees={modelTrees} onClick={this.onClick} ref={(ref) => (this.mapRef = ref)}>

                </Map>

                <div className="control-panel">
                <Typography variant="display1" gutterBottom>
                    Urban Tree Codex
                </Typography>
                <Typography variant="subheading" gutterBottom>
                    IPFS + Ethereum Tree Tracker.
                </Typography>

                <Geolocation maximumAge={100}
                             enableHighAccuracy={true}
                             onSuccess={setCurrentPosition}
                             onError={error => console.log(error)}
                             ref={(ref) => (this.innerRef = ref)}
                />

                <img src={this.state.image} alt='tree img' style={{width: '100%'}}/>
                <input type="file" name="photo" id="photo"/>
                <Button color="primary" onClick={this.upload}>
                    Upload Image
                </Button>

                <br/>
                <TextField
                    id="latitude"
                    label="Latitude"
                    className={classes.textField}
                    value={this.state.latitude}
                    onChange={this.handleChange('latitude')}
                    margin="normal"
                />
                <br/>

                <TextField
                    id="longitude"
                    label="Longitude"
                    className={classes.textField}
                    value={this.state.longitude}
                    onChange={this.handleChange('longitude')}
                    margin="normal"
                />
                <br/><button
                className="pure-button pure-button-primary"
                id="button-position-update"
                onClick={getLocation}
                type="button"
            >
                Update location
            </button>
                <br/>
                {/*<TextField
                            id="genus"
                            label="Genus"
                            className={classes.textField}
                            value={this.state.genus}
                            onChange={this.handleChange('genus')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="species"
                            label="Species"
                            className={classes.textField}
                            value={this.state.species}
                            onChange={this.handleChange('species')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="canopy-diameter"
                            label="Canopy Diameter"
                            className={classes.textField}
                            value={this.state.canopyDiameter}
                            onChange={this.handleChange('canopyDiameter')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="height"
                            label="Height"
                            className={classes.textField}
                            value={this.state.height}
                            onChange={this.handleChange('height')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="base-diameter"
                            label="Base Diameter"
                            className={classes.textField}
                            value={this.state.baseDiameter}
                            onChange={this.handleChange('baseDiameter')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="diameter-at-breast-height (DAB)"
                            label="Diameter at Breast Height (DAB)"
                            className={classes.textField}
                            value={this.state.diameterBreastHeight}
                            onChange={this.handleChange('diameterBreastHeight')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="carbon"
                            label="Carbon sequester/sequestration"
                            className={classes.textField}
                            value={this.state.carbon}
                            onChange={this.handleChange('carbon')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="aqi"
                            label="Air quality improvement"
                            className={classes.textField}
                            value={this.state.aqi}
                            onChange={this.handleChange('aqi')}
                            margin="normal"
                        />
                        <br/>
                        <TextField
                            id="energy-conservation"
                            label="Energy conservation"
                            className={classes.textField}
                            value={this.state.energyConservation}
                            onChange={this.handleChange('energyConservation')}
                            margin="normal"
                        />
                        <br/>*/}
                <Button
                    color="primary"
                    variant="raised"
                    onClick={this.handleSaveTree}
                >
                    Add Tree
                </Button>
            </div>
            </div>
        );
    }
}

Index.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withRoot(withStyles(styles)(Index));
