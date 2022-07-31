using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Website.Models
{
    public class Album
    {
        public const string folderPath = "/Images/Music/Albums/";

        public string FilePath { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string YoutubeLink { get; set; } = string.Empty;

        public Album(string filePath, string name, string artist, string description, string youtubeLink)
        {
            FilePath = filePath;
            Name = name;
            Artist = artist;
            Description = description;
            YoutubeLink = youtubeLink;
        }
    }

    public class AlbumCollection : List<Album>
    {
        public AlbumCollection()
        {
            Add(new Album(Album.folderPath + "Dingir.jpg", "Dingir", "Rings of Saturn", "", ""));
            Add(new Album(Album.folderPath + "Gidim.jpg", "Gidim", "Rings of Saturn", "", ""));
            Add(new Album(Album.folderPath + "ROS.jpg", "Rings of Saturn", "Rings of Saturn", "", ""));
            Add(new Album(Album.folderPath + "Dingir.jpg", "Ultu Ulla", "Rings of Saturn", "", ""));
            Add(new Album(Album.folderPath + "Symphony X.jpg", "Symphony X", "Symphony X", "", ""));
            Add(new Album(Album.folderPath + "TDWOT.jpg", "The Divine Wings of Tragedy", "Symphony X", "", ""));
            Add(new Album(Album.folderPath + "The Odyssey.jpg", "The Odyssey", "Symphony X", "", ""));
            Add(new Album(Album.folderPath + "Underworld.jpg", "Underworld", "Symphony X", "", ""));
            Add(new Album(Album.folderPath + "Battelions of Fear.jpg", "Battelions of Fear", "Blind Guardian", "", ""));
            Add(new Album(Album.folderPath + "At the Edge of Time.jpg", "At the Edge of Time", "Blind Guardian", "", ""));
            Add(new Album(Album.folderPath + "Beyond the Red Mirror.jpg", "Beyond the Red Mirror", "Blind Guardian", "", ""));
            Add(new Album(Album.folderPath + "Days of Future Past.jpg", "Days of Future Past", "Moody Blues", "", ""));
            Add(new Album(Album.folderPath + "Chicago Transit Authority.jpg", "Chicago Transit Authority", "Chicago (Transit Authority)", "", ""));
            Add(new Album(Album.folderPath + "The Singularity.jpg", "The Singularity (Part 1: Neohumanity)", "Scar Symmetry", "", ""));
            Add(new Album(Album.folderPath + "Pitch Black Progress.jpg", "Pitch Black Progress", "Scar Symmetry", "", ""));
        }
    }
}