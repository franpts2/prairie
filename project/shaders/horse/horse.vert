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
        
        // Define smooth skinning transition zone for leg joint attachment
        float transitionStart = -0.18;
        float transitionEnd = -0.08;
        float legWeight = 1.0 - smoothstep(transitionStart, transitionEnd, aVertexPosition.y);
        
        // Isolate legs longitudinally (front and back leg regions only, excluding middle belly)
        float zWeight = (aVertexPosition.z > -0.15 || aVertexPosition.z < -0.55) ? 1.0 : 0.0;
        float finalLegWeight = legWeight * zWeight;
        
        // 1. Calculate Leg Swung Position (rotation around joint pivot)
        vec3 legPos = aVertexPosition;
        float jointY = -0.10;
        float isLeft = aVertexPosition.x < 0.0 ? 1.0 : 0.0;
        float isFront = aVertexPosition.z > 0.0 ? 1.0 : 0.0;
        
        float jointX = isLeft > 0.5 ? -0.11 : 0.09;
        float jointZ = isFront > 0.5 ? 0.11 : -0.78;
        
        float phase = 0.0;
        if ((isFront > 0.5 && isLeft < 0.5) || (isFront < 0.5 && isLeft > 0.5)) {
            phase = 3.14159;
        }
        
        float swingRange = 0.35 * clamp(speedFactor, 0.3, 1.0);
        float angle = sin(walkTime + phase) * swingRange;
        
        vec3 localPos = aVertexPosition - vec3(jointX, jointY, jointZ);
        
        float cosA = cos(angle);
        float sinA = sin(angle);
        vec3 rotatedPos = vec3(
            localPos.x,
            localPos.y * cosA - localPos.z * sinA,
            localPos.y * sinA + localPos.z * cosA
        );
        
        legPos = rotatedPos + vec3(jointX, jointY, jointZ);
        
        // 2. Calculate Body Position (with head/neck sway sway)
        vec3 bodyPos = aVertexPosition;
        if (aVertexPosition.z > 0.3 && aVertexPosition.y > 0.1) {
            float headSwayRange = 0.04 * clamp(speedFactor, 0.3, 1.0);
            float sway = cos(walkTime * 2.0) * headSwayRange;
            bodyPos.y += sway;
            bodyPos.z += sway * 0.5;
        }
        
        // 3. Smoothly blend leg and body position to prevent joint stretching/bulges
        displacedPosition = mix(bodyPos, legPos, finalLegWeight);
        
        // 4. Apply uniform body bobbing to all vertices (legs and body move together)
        float bobRange = 0.03 * clamp(speedFactor, 0.3, 1.0);
        float bob = sin(walkTime * 2.0) * bobRange;
        displacedPosition.y += bob;
    }

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}
