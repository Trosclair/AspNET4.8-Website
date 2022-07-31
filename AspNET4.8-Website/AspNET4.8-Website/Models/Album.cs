using System.Collections.Generic;

namespace Website.Models
{
    public class Album
    {
        public const string FolderPath = "/Images/Music/Albums/";

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
            Add(new Album(Album.FolderPath + "Dingir.jpg", "Dingir", "Rings of Saturn", "", "https://www.youtube.com/watch?v=aYdUpr-HS_s"));
            Add(new Album(Album.FolderPath + "Gidim.jpg", "Gidim", "Rings of Saturn", "", "https://www.youtube.com/watch?v=xO20c4qOIwk"));
            Add(new Album(Album.FolderPath + "ROS.jpg", "Rings of Saturn", "Rings of Saturn", "", "https://www.youtube.com/watch?v=9oQVB9lZ-FE"));
            Add(new Album(Album.FolderPath + "Ultu Ulla.jpg", "Ultu Ulla", "Rings of Saturn", "", "https://www.youtube.com/watch?v=5biHrHJxmo4"));
            Add(new Album(Album.FolderPath + "Symphony X.jpg", "Symphony X", "Symphony X", "", "https://www.youtube.com/watch?v=A4tubDG7wcw&list=OLAK5uy_nal49LD-Q_jIn0309i78IQBJBU-jrmkE8"));
            Add(new Album(Album.FolderPath + "TDWOT.jpg", "The Divine Wings of Tragedy", "Symphony X", "", "https://www.youtube.com/watch?v=ky5teUBBH2A&list=OLAK5uy_mx0GSa36Er1BksJKi1rIWPxNHoRXdYH0A"));
            Add(new Album(Album.FolderPath + "The Odyssey.jpg", "The Odyssey", "Symphony X", "", "https://www.youtube.com/watch?v=CyNVn5ieHWI&list=OLAK5uy_nGKw74O6hiUmYcUmVUP3evOUaYPK5_fS4"));
            Add(new Album(Album.FolderPath + "Underworld.jpg", "Underworld", "Symphony X", "", "https://www.youtube.com/watch?v=bEABKU7pf-4&list=OLAK5uy_lCOunp7TMUGzGCIeRWD2fmqSJIRdl-89s"));
            Add(new Album(Album.FolderPath + "Battalions of Fear.jpg", "Battalions of Fear", "Blind Guardian", "", "https://www.youtube.com/watch?v=ozOXyQPLISc&list=OLAK5uy_kcKQ1-HIu-wu4ZD5-Nq2LOJdT3YNsa3FA"));
            Add(new Album(Album.FolderPath + "At the Edge of Time.jpg", "At the Edge of Time", "Blind Guardian", "", "https://www.youtube.com/watch?v=e6Y2qGK--NI&list=OLAK5uy_l9lr45gopkzKTKAGZJlL7q4KtLzk5KNpI"));
            Add(new Album(Album.FolderPath + "Beyond the Red Mirror.jpg", "Beyond the Red Mirror", "Blind Guardian", "", "https://www.youtube.com/watch?v=klVGR0JZmcg&list=PLEZBVtYYccugF71YnPxm3gEPw5VcoYfyq"));
            Add(new Album(Album.FolderPath + "Days of Future Past.jpg", "Days of Future Past", "Moody Blues", "", "https://www.youtube.com/watch?v=ETB02LAgON8&list=PLzEG2f9QAl8Oq2k0TQ96E3rNhIkdtQkek"));
            Add(new Album(Album.FolderPath + "Chicago Transit Authority.jpg", "Chicago Transit Authority", "Chicago (Transit Authority)", "", "https://www.youtube.com/watch?v=19gCLq-Zmnw&list=PLVMgMdYqIEkboVaFK7HUlFXlRqa4DPXv6"));
            Add(new Album(Album.FolderPath + "The Singularity.jpg", "The Singularity (Part 1: Neohumanity)", "Scar Symmetry", "", "https://www.youtube.com/watch?v=x5TwERiFvYw&list=OLAK5uy_kELTEBb-9_4u5ktDiPs7hrH0udpQuDw7Q"));
            Add(new Album(Album.FolderPath + "Pitch Black Progress.jpg", "Pitch Black Progress", "Scar Symmetry", "", "https://www.youtube.com/watch?v=Khb6ymIfK3A&list=OLAK5uy_nvVVaAWg8Yeqps3fNqC4awD0TIRpP5cNY"));
        }
    }
}