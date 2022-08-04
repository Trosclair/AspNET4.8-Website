using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TailWindTest.Models
{
    public class Project
    {
        public const string FolderPath = "/Images/Projects/";
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public bool InProgress { get; set; } = false;
        public string Filepath { get; set; } = string.Empty;

        public Project(string name, string description, string techStack, bool inProgress, string filepath)
        {
            Name = name;
            Description = description;
            TechStack = techStack;
            InProgress = inProgress;
            Filepath = filepath;
        }
    }

    public class ProjectCollection : List<Project>
    {
        public ProjectCollection()
        {
            Add(new Project("Console Tetris", "A C# Console app originally written in 2018. We all start somewhere right?", "C#, .NET Framework 4.8, .NET 6", false, "ConsoleTetris.PNG"));
        }
    }
}