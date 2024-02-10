#version 430 compatibility


in vec4	Color;
in vec4 test;
in vec2 fCoord;

uniform float Green;
uniform float camX, camY, camZ;
uniform float zoom;
uniform bool useBack;

uniform float angX, angY;
uniform float xS;

uniform float   uKa = 0.25; //(0.1)	 // coefficients of each type of lighting -- make sum to 1.0
uniform float 	uKd = 0.6; //(0.6)
uniform float 	uKs = 0.4; //(0.4)
uniform vec4    uSpecularColor = vec4 (1.,1.,1.,1.);	// light color
uniform float   uShininess = 10.;	 					// specular exponent

uniform float Timer;

struct sphere {
	vec3 s;
	float r;
};

struct scene {
	sphere s[2];
	int sNum; 
};

struct hitInfo {
	float t;	//ray ticks
	float c;	//count
	vec3 pos;	//hit position
	vec3 norm;	//hit normal
	vec3 color;	//color of hit
};

vec3 RotateNormal( float angx, float angy, vec3 n );
float dist( vec3 p, scene s );
float signDistSph( vec3 p, sphere s );
hitInfo getHitInfo( hitInfo h );


vec3 RotateNormal( float angx, float angy, vec3 n )
{
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
};

float dist( vec3 p, scene s ) {
	float d = 999999999.;
	float dt = 999999999.;
	for(int i = 0; i < s.sNum; i++ ){
		dt = signDistSph( p, s.s[i]);
		if(dt < d)
			d = dt;
	}

	return d;
}

float signDistSph( vec3 p, sphere S ){
	float d = distance( p, S.s ) - S.r;
	return d;
}

hitInfo getHitInfo( hitInfo h ) {
	return h;
}


void
main( void )
{

	vec3 cam = vec3( camX, camY, camZ);
	vec3 ray = vec3(fCoord.x, fCoord.y, zoom);

	float angx = angY * 3.14/2.;
	float angy = angX * 3.14/2.;

	ray = RotateNormal(angx, angy, ray);


	//marching into scene

	vec3 p = cam;
	float d;
	float total_d = 0.;
	hitInfo hit;
	hit.t = -1.;
	

	sphere Sphere;
	Sphere.s = vec3(0., 0., 0.);
	Sphere.r = 0.5;
	
	sphere Sphere2;
	Sphere2.s = vec3(0.75, 0.75, 0.);
	Sphere2.r = 0.15;

	scene Scene;
	Scene.s[0] = Sphere;
	Scene.s[1] = Sphere2;
	Scene.sNum = 2;

	for(int i = 0; i < 80; i++) {
		d = dist(p, Scene);
		p += d*ray;
		total_d += d; 
		if(d < 0.002 ) {
			hit.t = d;
			hit.c = i;
			break;
		}
		if(d > 400)
			break;
	}

	// get info about what hit

	hit = getHitInfo( hit );
	float sc = 0.07;
	hit.c = abs(mod(p.x-sc/2., sc)-(sc/2.));

	gl_FragColor = vec4(0., 0., 0., 0.);
	if (hit.t > 0){
		gl_FragColor = vec4( 0., 0., hit.c/sc, 1.0 );
	}
	
}
