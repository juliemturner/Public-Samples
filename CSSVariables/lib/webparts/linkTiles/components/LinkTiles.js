var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from 'react';
import { Logger } from "@pnp/logging";
import * as lodash from "lodash";
import styles from './LinkTiles.module.scss';
import Tile from './Tile';
var LinkTilesState = /** @class */ (function () {
    function LinkTilesState() {
    }
    return LinkTilesState;
}());
export { LinkTilesState };
var LinkTiles = /** @class */ (function (_super) {
    __extends(LinkTiles, _super);
    function LinkTiles(props) {
        var _this = _super.call(this, props) || this;
        _this.LOG_SOURCE = "LinkTiles";
        _this.state = new LinkTilesState();
        return _this;
    }
    LinkTiles.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
            return false;
        return true;
    };
    LinkTiles.prototype.render = function () {
        var _this = this;
        //Create the CSS Variables based on the web part properties
        var styleBlock = { "--tileWidth": this.props.width + "px", "--tileHeight": this.props.height + "px" };
        //Render tile container as flex box
        try {
            return (React.createElement("div", { className: styles.linkTiles + " " + styles.tileCont, style: styleBlock }, this.props.tiles && this.props.tiles.length > 0 && this.props.tiles.map(function (t) {
                return (React.createElement(Tile, { tile: t, showTitle: _this.props.showTitle }));
            })));
        }
        catch (err) {
            Logger.write(err + " - " + this.LOG_SOURCE + " (render)", 3 /* Error */);
            return null;
        }
    };
    return LinkTiles;
}(React.Component));
export default LinkTiles;
//# sourceMappingURL=LinkTiles.js.map