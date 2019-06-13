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
import * as React from "react";
import { Logger } from "@pnp/logging";
import * as lodash from "lodash";
import styles from './LinkTiles.module.scss';
var TileState = /** @class */ (function () {
    function TileState() {
    }
    return TileState;
}());
export { TileState };
var Tile = /** @class */ (function (_super) {
    __extends(Tile, _super);
    function Tile(props) {
        var _this = _super.call(this, props) || this;
        _this.LOG_SOURCE = "Tile";
        _this.clickTile = function () {
            //Open link in new blank tab
            window.open(_this.props.tile.LinkLocation.Url, "_blank");
        };
        _this.state = new TileState();
        return _this;
    }
    Tile.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
            return false;
        return true;
    };
    Tile.prototype.render = function () {
        try {
            //Render a tile with front and back
            return (React.createElement("div", { className: styles.tile, onClick: this.clickTile },
                React.createElement("div", { className: styles.tileFlip },
                    React.createElement("div", { className: styles.tileFront },
                        React.createElement("img", { src: this.props.tile.BackgroundImageLocation.Url }),
                        this.props.showTitle &&
                            React.createElement("div", { className: styles.tileTitle }, this.props.tile.Title)),
                    React.createElement("div", { className: styles.tileBack },
                        React.createElement("div", { className: styles.tileDescription }, this.props.tile.Description)))));
        }
        catch (err) {
            Logger.write(err + " - " + this.LOG_SOURCE + " (render)", 3 /* Error */);
            return null;
        }
    };
    return Tile;
}(React.Component));
export default Tile;
//# sourceMappingURL=Tile.js.map