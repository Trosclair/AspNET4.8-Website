using System.Web.Mvc;
using Website.Models;

namespace Website.Controllers
{
    public class MusicController : Controller
    {
        // GET: Music
        public ActionResult SelectedSounds()
        {
            return View(new AlbumCollection());
        }

        public ActionResult Gear()
        {
            return View(new GearCollection());
        }

        public ActionResult RedirectToYoutube(string url)
        {
            return Redirect(url);
        }
    }
}