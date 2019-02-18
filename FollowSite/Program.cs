using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using Microsoft.SharePoint.Client;

namespace FollowSite
{
    class Program
    {
        static void Main(string[] args)
        {
            const string _tenant = "<Your Tenant Name>"; //e.g. 'contoso'
            const string _username = "<User with SCA to each tenant-my.sharepoint.com site collection>";
            SecureString _password = null; //The password for _username

            var user = "<User you want to follow the site for, replace @ and . with _>"; //e.g. 'test_contoso_com'
            
            var socialSite = $"https://{_tenant}-my.sharepoint.com/personal/{user}";
            var socialPartial = $"/personal/{user}";
            
            var followSite = $"https://{_tenant}.sharepoint.com/sites/MySite";

            Guid webId = new Guid("<Web Id for followSite root web>");
            string webTitle = "<Title of followSite>";
            Guid siteId = new Guid("<Site Id for followSite>");
            
            using (ClientContext ctx = new ClientContext(socialSite))
            {
                ctx.Credentials = new SharePointOnlineCredentials(_username, _password);
                try
                {
                    //Hidden list that contains followed sites, documents, and items
                    var list = ctx.Web.Lists.GetByTitle("Social");
                    ctx.Load(list);

                    //Validate the 'Private' folder exists -- for a user who hasn't followed anything it will not be there.
                    var folderPrivate = ctx.Web.GetFolderByServerRelativeUrl($"{socialPartial}/Social/Private");
                    ctx.Load(folderPrivate);
                    try
                    {
                        ctx.ExecuteQuery();
                    }
                    catch (Exception ex)
                    {
                        //Create private and Followed site
                        var info = new ListItemCreationInformation();
                        info.UnderlyingObjectType = FileSystemObjectType.Folder;
                        info.LeafName = "Private";
                        ListItem newFolder = list.AddItem(info);
                        newFolder["Title"] = "Private";
                        newFolder["ContentTypeId"] =
                            "0x01200029E1F7200C2F49D9A9C5FA014063F220006553A43C7080C04AA5273E7978D8913D";
                        newFolder.Update();
                        ctx.ExecuteQuery();
                    }

                    //Validate the 'FollowedSites' folder exists -- for a user who hasn't followed anything it will not be there.
                    var folderFollowed = ctx.Web.GetFolderByServerRelativeUrl($"{socialPartial}/Social/Private/FollowedSites");
                    ctx.Load(folderFollowed);
                    try
                    {
                        ctx.ExecuteQuery();
                    }
                    catch (Exception ex)
                    {
                        //Create private and Followed site
                        var info = new ListItemCreationInformation();
                        info.UnderlyingObjectType = FileSystemObjectType.Folder;
                        info.FolderUrl = $"{socialPartial}/Social/Private";
                        info.LeafName = "FollowedSites";
                        ListItem newFolder = list.AddItem(info);
                        newFolder["Title"] = "FollowedSites";
                        newFolder["ContentTypeId"] = "0x0120001F6E5E1DE9E5447195CFF4F4FC5DDF5B00545FD50747B4D748AA2F22CD9D0BCB5E";
                        newFolder.Update();
                        ctx.ExecuteQuery();
                    }

                    //Create the new follow item for the site, in the FollowedSites folder.
                    var infoItem = new ListItemCreationInformation();
                    infoItem.FolderUrl = $"{socialPartial}/Social/Private/FollowedSites";
                    var newFollowedSite = list.AddItem(infoItem);
                    newFollowedSite["Title"] = webTitle;
                    newFollowedSite["ContentTypeId"] = "0x01FC00533CDB8F4EAE447D941948EFAE32BFD500D2687BB5643C16498964AD0C58FBA2F3";
                    newFollowedSite["Url"] = followSite;
                    newFollowedSite["SiteId"] = siteId;
                    newFollowedSite["WebId"] = webId;
                    newFollowedSite.Update();
                    ctx.ExecuteQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
        }
    }
}
