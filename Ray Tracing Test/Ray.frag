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
uniform float   uShininess = 10;	 					// specular exponent

uniform float Timer;

struct sphere {
	vec3 s;
	float r;
};

struct hitInfo {
	float t;
	vec3 pos;
	vec3 normal;
};


float sphere_hit( vec3 r, vec3 c, vec3 s, float rad) {
	// r = ray
	// c = cam
	// s = sphere
	// r = radius
	float A = r.x*r.x + r.y*r.y + r.z*r.z;
	float B = 2. * (r.x*(c.x-s.x)+r.y*(c.y-s.y)+r.z*(c.z-s.z));
	float C = pow(c.x-s.x, 2) + pow(c.y-s.y, 2) + pow(c.z-s.z, 2) - rad*rad;

	return (B*B - 4.0*A*C);
}

hitInfo sphere_hit_info( vec3 r, vec3 c, vec3 s, float rad) {
	// r = ray
	// c = cam
	// s = sphere
	// r = radius
	hitInfo info;


	float A = r.x*r.x + r.y*r.y + r.z*r.z;
	float B = 2. * (r.x*(c.x-s.x)+r.y*(c.y-s.y)+r.z*(c.z-s.z));
	float C = pow(c.x-s.x, 2.) + pow(c.y-s.y, 2.) + pow(c.z-s.z, 2.) - rad*rad;

	float t = -1;
	float det = (B*B - 4.0*A*C);
	if( det >= 0.) {
		float t1 = (-B + pow(det, 1./2.))/(2.*A);
		float t2 = (-B - pow(det, 1./2.))/(2.*A);

		if( t1 >= 0. && t2 >= 0. ){
			if(useBack){
				t = max(t1, t2);
			}else{
				t = min(t1, t2);
			}
			
		}
		if( t1 >= 0. && t2 < 0.){
			t = t1;
		}
		if( t1 < 0. && t2 >= 0.){
			t = t2;
		}
	}

	info.t = t;
	info.pos = c + t*r;

	if(useBack){
		info.normal = s - info.pos;
	}else{
		info.normal = info.pos - s;
	}
	
	return info;

}

float loop_spheres(vec3 r, vec3 c, sphere sph) {
	return 1;
}

vec3
RotateNormal( float angx, float angy, vec3 n )
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
}


void
main( void )
{

	float res = 1024.;
	int coordID = int(res*res*fCoord.y + res*fCoord.x);

	float TimerIDFl = Timer;
	float TimerDiv = 2.;
	float TimerFreq = 10.*120.;
	int TimerID = int(mod(TimerIDFl*TimerDiv*TimerFreq, TimerDiv));

	if(mod(coordID-TimerID,TimerDiv) != 0){
		discard;
	}


	vec3 cam = vec3( camX, camY, camZ);
	vec3 ray = vec3(fCoord.x, fCoord.y, zoom);

	float angx = angY * 3.14/2.;
	float angy = angX * 3.14/2.;

	ray = RotateNormal(angx, angy, ray);


	hitInfo hit;
	hit.t = -1;
	hitInfo hit1;

	for(float i = -1.0; i <= 1.0; i+=0.25){
		for(float j = -1.0; j <= 1.0; j+=0.25){
			hit1 = sphere_hit_info( ray, cam, vec3( i, j, 0.), 0.075);
			if(hit1.t > 0){
				if(hit1.t < hit.t)
					hit = hit1;
				if(hit.t == -1)
					hit = hit1;
			}
			
		}
	}


	// float t = sphere_hit_place( ray, cam, vec3( 0., 0., 0.), 0.5);
	float sph = 0;;
	
	

	gl_FragColor = vec4( vec3(0, 0, sph), 1.0 );


	//basic lighting
	vec3 	myColor = vec3( 0.8, 0.8, 0.8);	// obejct color


	if( hit.t >= 0) {
		vec3 Normal = normalize(hit.normal);
		vec3 Light  = normalize(vec3( 1.*cos(2.*3.14*Timer), 1.*sin(2.*3.14*Timer), -1. ));
		vec3 Eye    = normalize(-ray);

		vec3 ambient = uKa * myColor;

		float dd = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
		vec3 diffuse = uKd * dd * myColor;

		float ss = 0.;
		if( dot(Normal,Light) > 0. )	      // only do specular if the light can see the point
		{
			vec3 ref = normalize(  reflect( -Light, Normal )  );
			ss = pow( max( dot(Eye,ref),0. ), uShininess );
		}
		vec3 specular = uKs * ss * uSpecularColor.rgb;
		gl_FragColor = vec4( ambient + diffuse + specular,  1. );
		// gl_FragColor = vec4(0., 0., dot(Normal, Eye), 1.0);
		// gl_FragColor = vec4(Normal, 1.0);
	}

	
}
