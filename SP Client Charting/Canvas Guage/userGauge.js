'use strict';
CG.canvasDemo.directive('userGuage', function () {
    return {
        scope: {
            username: '@firstname',
            value: '@currentvalue',
            scale: '@maxvalue',
            image: '@userimage'
        },
        restrict: 'E',
        template: '<canvas class="userGuage" ng-style="{\'background-image\': image}" ></canvas><div class="userText"><span class="userName">{{username}}</span></div>',
        link: function link(scope, element, attrs) {
            var ctx = element[0].children[0].getContext("2d");
            var W = element[0].children[0].offsetWidth;
            var H = element[0].children[0].offsetHeight;
            var currentVal = Number(scope.value);
            var degrees = 0;
            var new_degrees = 0;
            var difference = 0;
            var color = "#000000";
            var colorfade = "gray"
            var bgcolor = "white";
            var linewidth = 17;
            var text;
            var animation_loop, redraw_loop;

            ctx.canvas.width = W;
            ctx.canvas.height = H;
            
            function init() {
                degrees = degrees < 1 ? 1 : degrees;
                if (degrees > 0 && degrees < 120) {
                    color = "rgba(68, 223, 0,";  //green
                } else if (degrees >= 120 && degrees < 240) {
                    color = "rgba(255, 222, 0,";  //yellow
                } else {
                    color = "rgba(223, 0, 0,";  //red
                }

                //Clear the canvas everytime a chart is drawn
                ctx.clearRect(0, 0, W, H);

                //Background 360 degree arc
                ctx.beginPath();
                ctx.strokeStyle = bgcolor;
                ctx.lineWidth = linewidth + 1;
                ctx.arc(W / 2, H / 2, (W - linewidth) / 2, 0, Math.PI * 2, false); //you can see the arc now
                ctx.stroke();
                ctx.closePath();

                //Guage arc
                //Angle in radians = angle in degrees * PI / 180
                var radians = degrees * Math.PI / 180;
                var radiansDash = 2 * Math.PI / 180;
                var radiansSegment = 30 * Math.PI / 180;
                var rStart = 0;
                var rEnd = 0;
                //Calculate # of segments to draw
                var segments = Math.ceil(radians / radiansSegment);
                var opacity = 1/segments;
                for (var l = 1; l <= segments; l++) {
                    rEnd = radiansSegment * l;
                    //Adjust for last segment - includ dash
                    rEnd = rEnd >= radians ? radians + radiansDash : rEnd;
                    //Draw arc segement
                    ctx.beginPath();
                    ctx.strokeStyle = color + (opacity * l) + ")";
                    ctx.lineWidth = linewidth;
                    ctx.arc(W / 2, H / 2, (W - linewidth) / 2, rStart - 90 * Math.PI / 180, (rEnd - radiansDash) - 90 * Math.PI / 180, false);
                    ctx.stroke();
                    ctx.closePath();
                    //Draw dash -- skip if end
                    if (rEnd < radians) {
                        ctx.beginPath();
                        ctx.strokeStyle = bgcolor;
                        ctx.arc(W / 2, H / 2, (W - linewidth) / 2, (rEnd - radiansDash) - 90 * Math.PI / 180, rEnd - 90 * Math.PI / 180, false);
                        ctx.stroke();
                        ctx.closePath();
                    }
                    //Save Start
                    rStart = rEnd;
                }
                //Mask player picutre as circle
                var maskCanvas = document.createElement('canvas');
                maskCanvas.width = W;
                maskCanvas.height = H;
                var maskCtx = maskCanvas.getContext('2d');
                maskCtx.fillStyle = bgcolor;
                maskCtx.fillRect(0, 0, W, H);
                maskCtx.globalCompositeOperation = 'xor';
                // Draw the shape you want to take out
                maskCtx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2, false);
                maskCtx.fill();
                ctx.drawImage(maskCanvas, 0, 0);
            }

            function draw(currentVal) {
                if (typeof animation_loop != undefined) clearInterval(animation_loop);
                new_degrees = Math.round(360 * (currentVal / scope.scale));
                new_degrees = new_degrees < 1 ? 1 : new_degrees;
                difference = new_degrees - degrees;
                animation_loop = setInterval(animate_to, 1000 / difference);
            }

            function animate_to() {
                if (degrees == new_degrees) {
                    clearInterval(animation_loop);
                }

                if (degrees < new_degrees)
                    degrees++;
                else
                    degrees--;
                init();
            }

            scope.$watch('value', function (value) {
                if (value != undefined && value != "") {
                    currentVal = Number(value);
                    if (!isNaN(currentVal))
                        draw(currentVal);
                }
            });

            if (!isNaN(currentVal))
                draw(currentVal);
            else
                draw(1);
        }
    };
});