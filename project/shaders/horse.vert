attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float uTime;
uniform float uSpeed;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main() {
    vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vTextureCoord = aTextureCoord;

    vec3 displacedPosition = aVertexPosition;

    // only animate if the horse is moving (uSpeed != 0.0)
    float speedFactor = abs(uSpeed);
    
    if (speedFactor > 0.05) {
        // adjust walking frequency based on speed
        float walkSpeed = 7.0;
        float walkTime = uTime * walkSpeed * clamp(speedFactor, 0.5, 1.5);
        
        // define joint height boundary
        float jointY = -0.10;
        
        // check if vertex belongs to the legs (Y < jointY)
        if (aVertexPosition.y < jointY) {
            float isLeft = aVertexPosition.x < 0.0 ? 1.0 : 0.0;
            float isFront = aVertexPosition.z > 0.0 ? 1.0 : 0.0;
            
            // choose hinge pivot (joint) X and Z
            float jointX = isLeft > 0.5 ? -0.11 : 0.09;
            float jointZ = isFront > 0.5 ? 0.11 : -0.78;
            
            // trot gait: diagonal pairs FrontLeft+BackRight (phase 0) vs FR+BL (phase PI)
            float phase = 0.0;
            if ((isFront > 0.5 && isLeft < 0.5) || (isFront < 0.5 && isLeft > 0.5)) {
                phase = 3.14159;
            }
            
            // determine swing angle (limit to max 0.35 rads)
            float swingRange = 0.35 * clamp(speedFactor, 0.3, 1.0);
            float angle = sin(walkTime + phase) * swingRange;
            
            // translate vertex to joint space
            vec3 localPos = aVertexPosition - vec3(jointX, jointY, jointZ);
            
            // rotate around local X axis
            float cosA = cos(angle);
            float sinA = sin(angle);
            vec3 rotatedPos = vec3(
                localPos.x,
                localPos.y * cosA - localPos.z * sinA,
                localPos.y * sinA + localPos.z * cosA
            );
            
            // translate back
            displacedPosition = rotatedPos + vec3(jointX, jointY, jointZ);
        } else {
            // body bobbing and neck/head pitching
            // body/head bobs twice as fast as the leg swing
            float bobRange = 0.03 * clamp(speedFactor, 0.3, 1.0);
            float bob = sin(walkTime * 2.0) * bobRange;
            displacedPosition.y += bob;
            
            // head/neck sway (Z > 0.3, Y > 0.1)
            if (aVertexPosition.z > 0.3 && aVertexPosition.y > 0.1) {
                float headSwayRange = 0.04 * clamp(speedFactor, 0.3, 1.0);
                float sway = cos(walkTime * 2.0) * headSwayRange;
                displacedPosition.y += sway;
                displacedPosition.z += sway * 0.5;
            }
        }
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
