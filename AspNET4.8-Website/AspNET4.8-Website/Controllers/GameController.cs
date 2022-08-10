using System.Web.Mvc;

namespace TailWindTest.Controllers
{
    public class GameController/*lmfao*/ : Controller
    {
        // GET: Game
        public ActionResult SelectedGames()
        {
            return View();
        }

        public ActionResult JSTetris()
        {
            return View();
        }

        public ActionResult TSTetris()
        {
            return View();
        }
    }
}