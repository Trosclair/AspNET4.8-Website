using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Website.Models;

namespace TailWindTest.Controllers
{
    public class MusicController : Controller
    {
        // GET: Music
        public ActionResult SelectedSounds()
        {
            return View(new AlbumCollection());
        }
    }
}