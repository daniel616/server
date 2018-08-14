

    //`addCollisionProperties` adds extra properties to sprites to help
    //simplify the collision code. It won't add these properties if they
    //already exist on the sprite. After these properties have been
    //added, this methods adds a Boolean property to the sprite called `_bumpPropertiesAdded`
    //and sets it to `true` to flag that the sprite has these
    //new properties

    //Assumes sprite already has x, y, width,height
    function addCollisionProperties(sprite) {

        //Add properties to Pixi sprites
        //if (this.renderer === "pixi") {
        //Hacked to ignore getGlobalPosition function

            //gx
            if (sprite.gx === undefined) {
                Object.defineProperty(sprite, "gx", {
                    get(){return sprite.x},
                    enumerable: true, configurable: true
                });
            }

            //gy
            if (sprite.gy === undefined) {
                Object.defineProperty(sprite, "gy", {
                    //get(){return sprite.getGlobalPosition().y},
                    get(){return sprite.y},
                    enumerable: true, configurable: true
                });
            }

            //centerX
            if (sprite.centerX === undefined) {
                Object.defineProperty(sprite, "centerX", {
                    get(){return sprite.x + sprite.width / 2},
                    enumerable: true, configurable: true
                });
            }

            //centerY
            if (sprite.centerY === undefined) {
                Object.defineProperty(sprite, "centerY", {
                    get(){return sprite.y + sprite.height / 2},
                    enumerable: true, configurable: true
                });
            }

            //halfWidth
            if (sprite.halfWidth === undefined) {
                Object.defineProperty(sprite, "halfWidth", {
                    get(){return sprite.width / 2},
                    enumerable: true, configurable: true
                });
            }

            //halfHeight
            if (sprite.halfHeight === undefined) {
                Object.defineProperty(sprite, "halfHeight", {
                    get(){return sprite.height / 2},
                    enumerable: true, configurable: true
                });
            }

            //xAnchorOffset
            if (sprite.xAnchorOffset === undefined) {
                Object.defineProperty(sprite, "xAnchorOffset", {
                    get(){
                        if (sprite.anchor !== undefined) {
                            return sprite.width * sprite.anchor.x;
                        } else {
                            return 0;
                        }
                    },
                    enumerable: true, configurable: true
                });
            }

            //yAnchorOffset
            if (sprite.yAnchorOffset === undefined) {
                Object.defineProperty(sprite, "yAnchorOffset", {
                    get(){
                        if (sprite.anchor !== undefined) {
                            return sprite.height * sprite.anchor.y;
                        } else {
                            return 0;
                        }
                    },
                    enumerable: true, configurable: true
                });
            }

            if (sprite.circular && sprite.radius === undefined) {
                Object.defineProperty(sprite, "radius", {
                    get(){return sprite.width / 2},
                    enumerable: true, configurable: true
                });
            }

        sprite._bumpPropertiesAdded = true;
    }

    /*
    rectangleCollision
    ------------------

    Use it to prevent two rectangular sprites from overlapping.
    Optionally, make the first rectangle bounce off the second rectangle.
    Parameters:
    a. A sprite object with `x`, `y` `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
    b. A sprite object with `x`, `y` `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
    c. Optional: true or false to indicate whether or not the first sprite
    should bounce off the second sprite.
    */

    //Assumes r1, r2 have x,y, width, and height
    function rectangleCollision(
        r1, r2, bounce = false, global = true
    ) {

        //Add collision properties
        if (!r1._bumpPropertiesAdded) addCollisionProperties(r1);
        if (!r2._bumpPropertiesAdded) addCollisionProperties(r2);

        let collision, combinedHalfWidths, combinedHalfHeights,
            overlapX, overlapY, vx, vy;

        //Calculate the distance vector
        if (global) {
            vx = (r1.gx + Math.abs(r1.halfWidth) - r1.xAnchorOffset) - (r2.gx + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
            vy = (r1.gy + Math.abs(r1.halfHeight) - r1.yAnchorOffset) - (r2.gy + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
        } else {
            //vx = r1.centerX - r2.centerX;
            //vy = r1.centerY - r2.centerY;
            vx = (r1.x + Math.abs(r1.halfWidth) - r1.xAnchorOffset) - (r2.x + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
            vy = (r1.y + Math.abs(r1.halfHeight) - r1.yAnchorOffset) - (r2.y + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
        }

        //Figure out the combined half-widths and half-heights
        combinedHalfWidths = Math.abs(r1.halfWidth) + Math.abs(r2.halfWidth);
        combinedHalfHeights = Math.abs(r1.halfHeight) + Math.abs(r2.halfHeight);

        //Check whether vx is less than the combined half widths
        if (Math.abs(vx) < combinedHalfWidths) {

            //A collision might be occurring!
            //Check whether vy is less than the combined half heights
            if (Math.abs(vy) < combinedHalfHeights) {
                //A collision has occurred! This is good!
                //Find out the size of the overlap on both the X and Y axes
                overlapX = combinedHalfWidths - Math.abs(vx);
                overlapY = combinedHalfHeights - Math.abs(vy);

                if (overlapX >= overlapY) {
                    //The collision is happening on the X axis
                    //But on which side? vy can tell us

                    if (vy > 0) {
                        collision = "top";
                        //Move the rectangle out of the collision
                        r1.y = r1.y + overlapY;
                    } else {
                        collision = "bottom";
                        //Move the rectangle out of the collision
                        r1.y = r1.y - overlapY;
                    }
                } else {

                    if (vx > 0) {
                        collision = "left";
                        //Move the rectangle out of the collision
                        r1.x = r1.x + overlapX;
                    } else {
                        collision = "right";
                        //Move the rectangle out of the collision
                        r1.x = r1.x - overlapX;
                    }

                }
            } else {
                //No collision
            }
        } else {
            //No collision
        }


        //Return the collision string. it will be either "top", "right",
        //"bottom", or "left" depending on which side of r1 is touching r2.
        return collision;
    }

module.exports={rectangleCollision};
