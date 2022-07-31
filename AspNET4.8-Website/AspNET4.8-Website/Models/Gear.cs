using System.Collections.Generic;

namespace Website.Models
{
    public class Gear
    {
        public const string FolderPath = "/Images/Music/Gear/";

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Filepath { get; set; } = string.Empty;

        public Gear(string name, string description, string filepath)
        {
            Name = name;
            Description = description;
            Filepath = filepath;
        }
    }

    public class GearCollection : List<Gear>
    {
        public GearCollection()
        {
            Add(new Gear("Schecter KM6 MK-III Berry Burst", "My latest edition to the family! This guitar comes stock with super active fishman fluence pickups, locking tuners, and hipshot bridge.", Gear.FolderPath + "BerryBurst.jpg"));
            Add(new Gear("Schecter KM7 MK-III Gloss Gray", "The best impulse buy ever! I procured this instrument when trading in my Line-6 Vetta and a few other pedals. I never planned on bringing home a guitar, but really glad I did. This guitar has locking tuners, a great set of fishman fluence moderns, and a hipshot bridge.", Gear.FolderPath + "GlossGray.jpg"));
            Add(new Gear("Schecter KM6 MK-III Toxic Smoke Green", "I bought this guitar for myself when I hit the 100 LBS lost on my weight loss journey, and have had it for about 3 years now. It has been my go to for learning guitar ever since. This guitar has stock Schecter Diamond pick ups, non-locking tuners, and a hipshot bridge.", Gear.FolderPath + "ToxicSmokeGreen.jpg"));
            Add(new Gear("Line-6 Helix", "I managed to pick this up for 900$ as a small birthday present for myself to replace my Vetta.", Gear.FolderPath + "helix.jpg"));
            Add(new Gear("JBL Party Speaker", "My dad gave me this speaker after he inherited the churches PA system. Lesson learned after having the cops called on me. Don't doubt the power of a Wal-Mart speaker.", Gear.FolderPath + "jbl speaker.jpg"));
        }
    }
}