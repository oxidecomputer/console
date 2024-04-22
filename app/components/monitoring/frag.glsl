precision highp float;

uniform sampler2D u_position_size_texture;
uniform sampler2D u_temperature_texture;
uniform float u_sensor_count;
uniform float u_aspect_ratio;
uniform sampler2D u_gradient_texture;

varying vec2 vUv;

void main() {
    vec4 color = vec4(1.0, 1.0, 1.0, 0.0);
    float maxBrightness = 0.0;
    float screenAlpha = 0.0; // Initialize screenAlpha

    float blurRadiusX = 0.6 * u_aspect_ratio;
    float blurRadiusY = 0.6;
    float offsetX = 0.02 * u_aspect_ratio;
    float offsetY = 0.02;

    bool isInside = false;

    for(float i = 0.0; i < u_sensor_count; i += 1.0) {
        float index = i / u_sensor_count;
        vec4 positionSizeData = texture2D(u_position_size_texture, vec2(index, 0.5));
        vec2 sensorPos = positionSizeData.xy;
        vec2 sensorSize = positionSizeData.zw;
        sensorPos.x += sensorSize.x / 2.0;
        sensorPos.y += sensorSize.y / 2.0;
        float sensorTemperature = texture2D(u_temperature_texture, vec2(index, 0.5)).r;
        float distX = abs(vUv.x - sensorPos.x) - (sensorSize.x / 2.0 + offsetX);
        float distY = abs(vUv.y - sensorPos.y) - (sensorSize.y / 2.0 + offsetY);
        float dist = length(vec2(max(distX, 0.0) / blurRadiusX, max(distY, 0.0) / blurRadiusY));

        float brightness = 0.0;
        if(dist <= max(offsetX, offsetY)) { // Inside of sensor
            brightness = sensorTemperature;
        } else if(dist <= (max(offsetX, offsetY) + max(blurRadiusX, blurRadiusY)) * 4.0) { // Blurred outside of sensor
            float edge0 = max(offsetX, offsetY);
            float edge1 = 1.0 - max(offsetX, offsetY);
            float blurFactor = smoothstep(edge0, edge1, dist);
            brightness = sensorTemperature * (1.0 - blurFactor);
            maxBrightness = max(maxBrightness, brightness); // Use max to accumulate the highest influence
        }

        screenAlpha = 1.0 - (1.0 - screenAlpha) * (1.0 - brightness);
        maxBrightness = max(maxBrightness, brightness); // Use max to accumulate the highest influence
    }

    color = texture2D(u_gradient_texture, vec2(0.5, 1.0 - maxBrightness));
    vec3 blendColor = vec3(0.062745098, 0.0862745098, 0.0941176471);
    vec3 finalColor = mix(blendColor, vec3(color), pow(screenAlpha, 2.0));
    // try opaque (use alpha to blend to bg)
    gl_FragColor = vec4(vec3(finalColor), 1.0);
}