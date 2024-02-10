#version 430 compatibility

out vec4 Color;
out vec4 test;

out vec3 camRay;
out vec2 fCoord;

uniform float camX, camY, camZ; 	// range : -2 -> 2
uniform float camDir;				//in range: 0 -> 2 for 0->360 degrees
uniform float eye;
uniform bool useEye;


void
main( void )
{
	Color = gl_Color;
	vec4 V = gl_Vertex;

	if(useEye){
		float R = pow(V.x*V.x + V.y*V.y, 1./2.);
		float c = V.x/R;
		float s = V.y/R;
		R = R/(R+eye*eye);
		V.x = R * c;
		V.y = R * s;
	}
	

	gl_Position = gl_ModelViewProjectionMatrix * V;
	test = gl_Position;

	// Configure the Ray
	vec2 vST = gl_MultiTexCoord0.st;

	fCoord = (vST*2) - 1.0;	//0->1 to 0->2, then -1->1
}
