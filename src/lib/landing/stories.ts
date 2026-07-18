// Customer-story identities. Language-neutral data (name + portrait) lives here;
// the localized role + quote live in the dictionaries (`stories.items`), matched
// by array index. Portraits are AI-generated faces downloaded at build time from
// thispersondoesnotexist.com and downscaled to 240×240 in /public/landing/faces.

export interface StoryPerson {
   name: string
   /** Local, optimized portrait — served through next/image with fixed dims. */
   face: string
   width: number
   height: number
}

export const STORY_PEOPLE: StoryPerson[] = [
   { name: "Valentina Ríos", face: "/landing/faces/story-1.jpg", width: 240, height: 240 },
   { name: "Mateo Fernández", face: "/landing/faces/story-2.jpg", width: 240, height: 240 },
   { name: "Camila Torres", face: "/landing/faces/story-3.jpg", width: 240, height: 240 },
   { name: "Santiago Morales", face: "/landing/faces/story-4.jpg", width: 240, height: 240 },
   { name: "Isabella Castro", face: "/landing/faces/story-5.jpg", width: 240, height: 240 },
   { name: "Sebastián Vargas", face: "/landing/faces/story-6.jpg", width: 240, height: 240 },
   { name: "Luciana Herrera", face: "/landing/faces/story-7.jpg", width: 240, height: 240 },
   { name: "Andrés Guzmán", face: "/landing/faces/story-8.jpg", width: 240, height: 240 },
]
